"""
Parallel Mind Engine - Worker Manager
Auto-scaling 4-16 workers based on demand
"""

import asyncio
import time
import uuid
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class WorkerStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    STARTING = "starting"
    STOPPING = "stopping"

@dataclass
class WorkerMetrics:
    """Metrics for individual worker"""
    worker_id: str
    status: WorkerStatus
    tasks_completed: int
    tasks_failed: int
    avg_task_time: float
    memory_usage_mb: float
    cpu_usage_percent: float
    last_activity: datetime
    uptime_seconds: float

@dataclass
class Task:
    """Task definition for worker execution"""
    task_id: str
    task_type: str
    data: Dict[str, Any]
    priority: int = 1
    timeout: float = 30.0
    retry_count: int = 0
    max_retries: int = 3
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

@dataclass
class TaskResult:
    """Result of task execution"""
    task_id: str
    success: bool
    result: Any
    error: Optional[str]
    execution_time: float
    worker_id: str
    completed_at: datetime

class Worker:
    """Individual worker for task execution"""
    
    def __init__(self, worker_id: str, task_executor: Callable):
        self.worker_id = worker_id
        self.status = WorkerStatus.IDLE
        self.task_executor = task_executor
        self.current_task: Optional[Task] = None
        self.metrics = WorkerMetrics(
            worker_id=worker_id,
            status=WorkerStatus.IDLE,
            tasks_completed=0,
            tasks_failed=0,
            avg_task_time=0.0,
            memory_usage_mb=0.0,
            cpu_usage_percent=0.0,
            last_activity=datetime.now(),
            uptime_seconds=0.0
        )
        self.start_time = datetime.now()
        self.task_times: List[float] = []
        self.is_running = False
        
    async def start(self) -> bool:
        """Start the worker"""
        try:
            self.status = WorkerStatus.STARTING
            self.is_running = True
            self.status = WorkerStatus.IDLE
            self.metrics.status = WorkerStatus.IDLE
            logger.debug(f"🟣 Worker {self.worker_id} started")
            return True
        except Exception as e:
            logger.error(f"🟣 Error starting worker {self.worker_id}: {e}")
            self.status = WorkerStatus.ERROR
            return False
    
    async def execute_task(self, task: Task) -> TaskResult:
        """Execute a task"""
        if self.status != WorkerStatus.IDLE:
            raise RuntimeError(f"Worker {self.worker_id} is not idle")
        
        self.status = WorkerStatus.BUSY
        self.metrics.status = WorkerStatus.BUSY
        self.current_task = task
        task.started_at = datetime.now()
        
        start_time = time.time()
        
        try:
            # Execute task with timeout
            result = await asyncio.wait_for(
                self.task_executor(task),
                timeout=task.timeout
            )
            
            execution_time = time.time() - start_time
            task.completed_at = datetime.now()
            
            # Update metrics
            self.metrics.tasks_completed += 1
            self.task_times.append(execution_time)
            if len(self.task_times) > 100:  # Keep last 100 task times
                self.task_times = self.task_times[-100:]
            self.metrics.avg_task_time = sum(self.task_times) / len(self.task_times)
            self.metrics.last_activity = datetime.now()
            
            # Create result
            task_result = TaskResult(
                task_id=task.task_id,
                success=True,
                result=result,
                error=None,
                execution_time=execution_time,
                worker_id=self.worker_id,
                completed_at=task.completed_at
            )
            
            logger.debug(f"🟣 Worker {self.worker_id} completed task {task.task_id} in {execution_time:.3f}s")
            
        except asyncio.TimeoutError:
            execution_time = time.time() - start_time
            self.metrics.tasks_failed += 1
            
            task_result = TaskResult(
                task_id=task.task_id,
                success=False,
                result=None,
                error=f"Task timeout after {task.timeout}s",
                execution_time=execution_time,
                worker_id=self.worker_id,
                completed_at=datetime.now()
            )
            
            logger.warning(f"🟣 Worker {self.worker_id} task {task.task_id} timed out")
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.metrics.tasks_failed += 1
            
            task_result = TaskResult(
                task_id=task.task_id,
                success=False,
                result=None,
                error=str(e),
                execution_time=execution_time,
                worker_id=self.worker_id,
                completed_at=datetime.now()
            )
            
            logger.error(f"🟣 Worker {self.worker_id} task {task.task_id} failed: {e}")
        
        finally:
            self.status = WorkerStatus.IDLE
            self.metrics.status = WorkerStatus.IDLE
            self.current_task = None
            self.metrics.uptime_seconds = (datetime.now() - self.start_time).total_seconds()
        
        return task_result
    
    async def stop(self) -> bool:
        """Stop the worker"""
        try:
            self.status = WorkerStatus.STOPPING
            self.is_running = False
            
            # Wait for current task to complete if any
            if self.current_task:
                logger.info(f"🟣 Worker {self.worker_id} waiting for current task to complete")
                # Give some time for task to complete gracefully
                await asyncio.sleep(1.0)
            
            self.status = WorkerStatus.IDLE
            logger.debug(f"🟣 Worker {self.worker_id} stopped")
            return True
            
        except Exception as e:
            logger.error(f"🟣 Error stopping worker {self.worker_id}: {e}")
            return False
    
    def get_metrics(self) -> WorkerMetrics:
        """Get current worker metrics"""
        self.metrics.uptime_seconds = (datetime.now() - self.start_time).total_seconds()
        return self.metrics

class WorkerManager:
    """
    Auto-scaling worker pool management (4-16 workers)
    Intelligent load balancing and resource allocation
    """
    
    def __init__(self, task_executor: Callable, min_workers: int = 4, max_workers: int = 16):
        self.task_executor = task_executor
        self.min_workers = min_workers
        self.max_workers = max_workers
        self.workers: Dict[str, Worker] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.results: Dict[str, TaskResult] = {}
        self.scaling_threshold = 0.8  # Scale up when 80% of workers are busy
        self.scale_down_threshold = 0.3  # Scale down when 30% of workers are busy
        self.last_scale_time = datetime.now()
        self.scale_cooldown = timedelta(seconds=30)  # Minimum time between scaling operations
        self.is_running = False
        self.worker_tasks: Dict[str, asyncio.Task] = {}
        
    async def initialize(self) -> bool:
        """Initialize worker manager with minimum workers"""
        try:
            # Start minimum workers
            for i in range(self.min_workers):
                worker_id = f"worker_{i:03d}"
                await self._create_worker(worker_id)
            
            self.is_running = True
            
            # Start background tasks
            asyncio.create_task(self._worker_monitor())
            asyncio.create_task(self._auto_scaler())
            
            logger.info(f"🟣 Worker Manager initialized with {len(self.workers)} workers")
            return True
            
        except Exception as e:
            logger.error(f"🟣 Failed to initialize Worker Manager: {e}")
            return False
    
    async def submit_task(self, task: Task) -> str:
        """Submit a task for execution"""
        if not self.is_running:
            raise RuntimeError("Worker Manager not running")
        
        await self.task_queue.put(task)
        logger.debug(f"🟣 Task {task.task_id} submitted to queue")
        return task.task_id
    
    async def get_result(self, task_id: str, timeout: float = 30.0) -> Optional[TaskResult]:
        """Get result for a task"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if task_id in self.results:
                result = self.results.pop(task_id)
                return result
            await asyncio.sleep(0.1)
        
        return None
    
    async def execute_task_sync(self, task: Task) -> TaskResult:
        """Execute a task synchronously and return result"""
        task_id = await self.submit_task(task)
        result = await self.get_result(task_id, task.timeout + 5.0)
        
        if result is None:
            return TaskResult(
                task_id=task_id,
                success=False,
                result=None,
                error="Task execution timeout",
                execution_time=task.timeout,
                worker_id="unknown",
                completed_at=datetime.now()
            )
        
        return result
    
    async def get_worker_metrics(self) -> List[WorkerMetrics]:
        """Get metrics for all workers"""
        return [worker.get_metrics() for worker in self.workers.values()]
    
    async def get_manager_stats(self) -> Dict[str, Any]:
        """Get comprehensive manager statistics"""
        try:
            worker_metrics = await self.get_worker_metrics()
            
            total_tasks = sum(m.tasks_completed + m.tasks_failed for m in worker_metrics)
            total_completed = sum(m.tasks_completed for m in worker_metrics)
            total_failed = sum(m.tasks_failed for m in worker_metrics)
            
            busy_workers = len([m for m in worker_metrics if m.status == WorkerStatus.BUSY])
            idle_workers = len([m for m in worker_metrics if m.status == WorkerStatus.IDLE])
            
            avg_task_time = 0.0
            if worker_metrics:
                task_times = [m.avg_task_time for m in worker_metrics if m.avg_task_time > 0]
                if task_times:
                    avg_task_time = sum(task_times) / len(task_times)
            
            stats = {
                'total_workers': len(self.workers),
                'busy_workers': busy_workers,
                'idle_workers': idle_workers,
                'queue_size': self.task_queue.qsize(),
                'total_tasks_processed': total_tasks,
                'tasks_completed': total_completed,
                'tasks_failed': total_failed,
                'success_rate': (total_completed / total_tasks * 100) if total_tasks > 0 else 0,
                'avg_task_time': avg_task_time,
                'worker_utilization': (busy_workers / len(self.workers) * 100) if self.workers else 0,
                'scaling_threshold': self.scaling_threshold,
                'last_scale_time': self.last_scale_time.isoformat()
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"🟣 Error getting manager stats: {e}")
            return {}
    
    async def scale_workers(self, target_count: int) -> bool:
        """Scale workers to target count"""
        try:
            current_count = len(self.workers)
            
            if target_count < self.min_workers:
                target_count = self.min_workers
            elif target_count > self.max_workers:
                target_count = self.max_workers
            
            if target_count == current_count:
                return True
            
            if target_count > current_count:
                # Scale up
                for i in range(target_count - current_count):
                    worker_id = f"worker_{len(self.workers):03d}"
                    await self._create_worker(worker_id)
                
                logger.info(f"🟣 Scaled up to {len(self.workers)} workers")
                
            else:
                # Scale down
                workers_to_remove = current_count - target_count
                idle_workers = [
                    worker_id for worker_id, worker in self.workers.items()
                    if worker.status == WorkerStatus.IDLE
                ]
                
                for i in range(min(workers_to_remove, len(idle_workers))):
                    worker_id = idle_workers[i]
                    await self._remove_worker(worker_id)
                
                logger.info(f"🟣 Scaled down to {len(self.workers)} workers")
            
            self.last_scale_time = datetime.now()
            return True
            
        except Exception as e:
            logger.error(f"🟣 Error scaling workers: {e}")
            return False
    
    async def _create_worker(self, worker_id: str) -> bool:
        """Create and start a new worker"""
        try:
            worker = Worker(worker_id, self.task_executor)
            success = await worker.start()
            
            if success:
                self.workers[worker_id] = worker
                # Start worker task processing
                self.worker_tasks[worker_id] = asyncio.create_task(
                    self._worker_loop(worker)
                )
                logger.debug(f"🟣 Created worker {worker_id}")
                return True
            else:
                logger.error(f"🟣 Failed to start worker {worker_id}")
                return False
                
        except Exception as e:
            logger.error(f"🟣 Error creating worker {worker_id}: {e}")
            return False
    
    async def _remove_worker(self, worker_id: str) -> bool:
        """Remove a worker"""
        try:
            if worker_id not in self.workers:
                return False
            
            worker = self.workers[worker_id]
            
            # Stop worker
            await worker.stop()
            
            # Cancel worker task
            if worker_id in self.worker_tasks:
                self.worker_tasks[worker_id].cancel()
                del self.worker_tasks[worker_id]
            
            # Remove from workers
            del self.workers[worker_id]
            
            logger.debug(f"🟣 Removed worker {worker_id}")
            return True
            
        except Exception as e:
            logger.error(f"🟣 Error removing worker {worker_id}: {e}")
            return False
    
    async def _worker_loop(self, worker: Worker) -> None:
        """Main loop for worker task processing"""
        while worker.is_running and self.is_running:
            try:
                # Get task from queue with timeout
                task = await asyncio.wait_for(self.task_queue.get(), timeout=1.0)
                
                # Execute task
                result = await worker.execute_task(task)
                
                # Store result
                self.results[task.task_id] = result
                
                # Mark task as done
                self.task_queue.task_done()
                
            except asyncio.TimeoutError:
                # No task available, continue
                continue
            except Exception as e:
                logger.error(f"🟣 Error in worker loop for {worker.worker_id}: {e}")
                await asyncio.sleep(1.0)
    
    async def _worker_monitor(self) -> None:
        """Monitor worker health and performance"""
        while self.is_running:
            try:
                # Check worker health
                for worker_id, worker in list(self.workers.items()):
                    if worker.status == WorkerStatus.ERROR:
                        logger.warning(f"🟣 Worker {worker_id} in error state, restarting")
                        await self._remove_worker(worker_id)
                        await self._create_worker(worker_id)
                
                await asyncio.sleep(10.0)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"🟣 Error in worker monitor: {e}")
                await asyncio.sleep(10.0)
    
    async def _auto_scaler(self) -> None:
        """Automatic scaling based on load"""
        while self.is_running:
            try:
                # Check if enough time has passed since last scaling
                if datetime.now() - self.last_scale_time < self.scale_cooldown:
                    await asyncio.sleep(5.0)
                    continue
                
                # Calculate current utilization
                worker_metrics = await self.get_worker_metrics()
                if not worker_metrics:
                    await asyncio.sleep(5.0)
                    continue
                
                busy_workers = len([m for m in worker_metrics if m.status == WorkerStatus.BUSY])
                total_workers = len(worker_metrics)
                utilization = busy_workers / total_workers if total_workers > 0 else 0
                
                queue_size = self.task_queue.qsize()
                
                # Scaling decisions
                if utilization > self.scaling_threshold or queue_size > total_workers:
                    # Scale up
                    target_workers = min(self.max_workers, total_workers + 2)
                    if target_workers > total_workers:
                        await self.scale_workers(target_workers)
                        logger.info(f"🟣 Auto-scaled up: utilization={utilization:.2f}, queue={queue_size}")
                
                elif utilization < self.scale_down_threshold and queue_size == 0:
                    # Scale down
                    target_workers = max(self.min_workers, total_workers - 1)
                    if target_workers < total_workers:
                        await self.scale_workers(target_workers)
                        logger.info(f"🟣 Auto-scaled down: utilization={utilization:.2f}, queue={queue_size}")
                
                await asyncio.sleep(15.0)  # Check every 15 seconds
                
            except Exception as e:
                logger.error(f"🟣 Error in auto-scaler: {e}")
                await asyncio.sleep(15.0)
    
    async def cleanup(self) -> None:
        """Cleanup worker manager"""
        try:
            self.is_running = False
            
            # Stop all workers
            for worker_id in list(self.workers.keys()):
                await self._remove_worker(worker_id)
            
            # Clear results
            self.results.clear()
            
            logger.info("🟣 Worker Manager cleanup completed")
            
        except Exception as e:
            logger.error(f"🟣 Error during cleanup: {e}")