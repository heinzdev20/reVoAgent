"""
Creative Engine - Innovation and Solution Generation
Target: 3-5 solution alternatives with 80% innovation score
"""

import asyncio
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

from .solution_generator import (
    SolutionGenerator, Solution, Problem, GenerationRequest, SolutionType
)
from .innovation_engine import (
    InnovationEngine, InnovationMetrics, BreakthroughCandidate, InnovationType
)
from .creativity_optimizer import (
    CreativityOptimizer, CreativityFeedback, OptimizationMetrics, OptimizationStrategy
)

logger = logging.getLogger(__name__)

@dataclass
class EngineStatus:
    """Creative Engine status"""
    status: str
    solutions_generated: int
    avg_innovation_score: float
    avg_creativity_score: float
    breakthrough_candidates: int
    optimization_efficiency: float
    learning_velocity: float
    last_activity: Optional[datetime]

class CreativeEngine:
    """
    Creative Engine - Innovation and solution generation with adaptive creativity
    
    Capabilities:
    - Generate 3-5 alternative solutions per request
    - Innovation scoring and breakthrough identification
    - Adaptive creativity optimization
    - Learning from feedback and performance
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.creativity_level = self.config.get('creativity_level', 0.8)
        self.innovation_bias = self.config.get('innovation_bias', 0.6)
        self.solution_count = self.config.get('solution_count', 5)
        self.learning_rate = self.config.get('learning_rate', 0.1)
        
        # Initialize components
        self.solution_generator = SolutionGenerator(
            creativity_level=self.creativity_level,
            innovation_bias=self.innovation_bias
        )
        self.innovation_engine = InnovationEngine(
            innovation_threshold=self.config.get('innovation_threshold', 0.7)
        )
        self.creativity_optimizer = CreativityOptimizer(
            learning_rate=self.learning_rate,
            adaptation_threshold=self.config.get('adaptation_threshold', 0.7)
        )
        
        self.is_initialized = False
        self.start_time = datetime.now()
        self.generation_history: List[Dict[str, Any]] = []
        self.performance_metrics: Dict[str, float] = {}
        
    async def initialize(self) -> bool:
        """Initialize the Creative Engine"""
        try:
            # Initialize components
            generator_init = await self.solution_generator.initialize()
            innovation_init = await self.innovation_engine.initialize()
            optimizer_init = await self.creativity_optimizer.initialize()
            
            if generator_init and innovation_init and optimizer_init:
                self.is_initialized = True
                logger.info("🩷 Creative Engine: Fully initialized")
                return True
            else:
                logger.error("🩷 Creative Engine: Failed to initialize components")
                return False
                
        except Exception as e:
            logger.error(f"🩷 Creative Engine initialization error: {e}")
            return False
    
    async def generate_creative_solutions(self, problem_description: str,
                                        requirements: List[str],
                                        constraints: List[str] = None,
                                        domain: str = "general",
                                        solution_count: Optional[int] = None,
                                        creativity_level: Optional[float] = None) -> List[Solution]:
        """
        Generate creative solutions for a given problem
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        start_time = time.time()
        
        try:
            # Create problem definition
            problem = Problem(
                problem_id=f"prob_{int(time.time() * 1000)}",
                description=problem_description,
                constraints=constraints or [],
                requirements=requirements,
                context={'domain': domain},
                domain=domain,
                complexity=self._estimate_complexity(problem_description, requirements)
            )
            
            # Optimize creativity parameters for this problem
            optimization_result = await self.creativity_optimizer.optimize_creativity_parameters(problem)
            optimized_params = optimization_result.get('optimized_parameters', {})
            
            # Create generation request with optimized parameters
            request = GenerationRequest(
                request_id=f"req_{int(time.time() * 1000)}",
                problem=problem,
                solution_count=solution_count or self.solution_count,
                creativity_level=creativity_level or optimized_params.get('creativity_level', self.creativity_level),
                innovation_bias=optimized_params.get('innovation_bias', self.innovation_bias),
                time_limit=30.0
            )
            
            # Generate solutions
            solutions = await self.solution_generator.generate_solutions(request)
            
            # Assess innovation potential for each solution
            for solution in solutions:
                innovation_metrics = await self.innovation_engine.assess_innovation_potential(solution)
                solution.implementation['innovation_metrics'] = innovation_metrics
            
            # Optimize solution diversity
            optimized_solutions = await self.creativity_optimizer.optimize_solution_diversity(
                solutions, target_diversity=optimized_params.get('diversity_weight', 0.7)
            )
            
            # Identify breakthrough candidates
            breakthrough_candidates = await self.innovation_engine.identify_breakthrough_candidates(
                optimized_solutions
            )
            
            generation_time = time.time() - start_time
            
            # Record generation history
            generation_record = {
                'timestamp': datetime.now().isoformat(),
                'problem_id': problem.problem_id,
                'solutions_generated': len(optimized_solutions),
                'breakthrough_candidates': len(breakthrough_candidates),
                'generation_time': generation_time,
                'optimization_applied': True,
                'avg_innovation_score': sum(s.innovation_score for s in optimized_solutions) / len(optimized_solutions),
                'avg_creativity_score': sum(s.creativity_score for s in optimized_solutions) / len(optimized_solutions)
            }
            self.generation_history.append(generation_record)
            
            # Keep only recent history
            if len(self.generation_history) > 100:
                self.generation_history = self.generation_history[-100:]
            
            logger.info(f"🩷 Generated {len(optimized_solutions)} creative solutions in {generation_time:.3f}s")
            return optimized_solutions
            
        except Exception as e:
            logger.error(f"🩷 Error generating creative solutions: {e}")
            raise
    
    async def generate_code_solutions(self, problem_description: str,
                                    requirements: List[str],
                                    constraints: List[str] = None,
                                    solution_count: int = 5) -> List[Solution]:
        """
        Generate creative code solutions
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            solutions = await self.solution_generator.generate_code_solutions(
                problem_description=problem_description,
                requirements=requirements,
                constraints=constraints,
                solution_count=solution_count
            )
            
            # Enhance with innovation assessment
            for solution in solutions:
                innovation_metrics = await self.innovation_engine.assess_innovation_potential(solution)
                solution.implementation['innovation_metrics'] = innovation_metrics
            
            logger.info(f"🩷 Generated {len(solutions)} code solutions")
            return solutions
            
        except Exception as e:
            logger.error(f"🩷 Error generating code solutions: {e}")
            raise
    
    async def generate_architecture_solutions(self, system_requirements: Dict[str, Any],
                                            constraints: List[str] = None,
                                            solution_count: int = 4) -> List[Solution]:
        """
        Generate creative architecture solutions
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            solutions = await self.solution_generator.generate_architecture_solutions(
                system_requirements=system_requirements,
                constraints=constraints,
                solution_count=solution_count
            )
            
            # Enhance with innovation assessment
            for solution in solutions:
                innovation_metrics = await self.innovation_engine.assess_innovation_potential(solution)
                solution.implementation['innovation_metrics'] = innovation_metrics
            
            logger.info(f"🩷 Generated {len(solutions)} architecture solutions")
            return solutions
            
        except Exception as e:
            logger.error(f"🩷 Error generating architecture solutions: {e}")
            raise
    
    async def generate_novel_approaches(self, problem_description: str,
                                      domain: str = "general",
                                      innovation_level: float = 0.8) -> List[Solution]:
        """
        Generate highly novel and innovative approaches
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            problem = Problem(
                problem_id=f"novel_{int(time.time() * 1000)}",
                description=problem_description,
                constraints=[],
                requirements=["High innovation", "Novel approach"],
                context={'domain': domain, 'innovation_focus': True},
                domain=domain,
                complexity=0.8
            )
            
            novel_solutions = await self.innovation_engine.generate_novel_approaches(
                problem=problem,
                innovation_level=innovation_level
            )
            
            logger.info(f"🩷 Generated {len(novel_solutions)} novel approaches")
            return novel_solutions
            
        except Exception as e:
            logger.error(f"🩷 Error generating novel approaches: {e}")
            raise
    
    async def identify_breakthrough_opportunities(self, solutions: List[Solution]) -> List[BreakthroughCandidate]:
        """
        Identify breakthrough opportunities in existing solutions
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            breakthrough_candidates = await self.innovation_engine.identify_breakthrough_candidates(solutions)
            
            logger.info(f"🩷 Identified {len(breakthrough_candidates)} breakthrough opportunities")
            return breakthrough_candidates
            
        except Exception as e:
            logger.error(f"🩷 Error identifying breakthrough opportunities: {e}")
            return []
    
    async def learn_from_feedback(self, solution_id: str,
                                user_rating: float,
                                effectiveness_score: float,
                                innovation_rating: float,
                                feasibility_rating: float,
                                feedback_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Learn from user feedback on generated solutions
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            feedback = CreativityFeedback(
                solution_id=solution_id,
                user_rating=user_rating,
                effectiveness_score=effectiveness_score,
                innovation_rating=innovation_rating,
                feasibility_rating=feasibility_rating,
                feedback_text=feedback_text
            )
            
            learning_result = await self.creativity_optimizer.learn_from_feedback(feedback)
            
            logger.debug(f"🩷 Processed feedback for solution {solution_id}")
            return learning_result
            
        except Exception as e:
            logger.error(f"🩷 Error learning from feedback: {e}")
            return {'feedback_processed': False, 'error': str(e)}
    
    async def analyze_innovation_trends(self, solutions: List[Solution]) -> Dict[str, Any]:
        """
        Analyze innovation trends across solutions
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            trends = await self.innovation_engine.analyze_innovation_trends(solutions)
            
            logger.debug(f"🩷 Analyzed innovation trends for {len(solutions)} solutions")
            return trends
            
        except Exception as e:
            logger.error(f"🩷 Error analyzing innovation trends: {e}")
            return {}
    
    async def optimize_creativity_settings(self, domain: str = "general") -> Dict[str, Any]:
        """
        Optimize creativity settings for better performance
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            # Create dummy problem for optimization
            problem = Problem(
                problem_id="optimization_probe",
                description="Optimization probe",
                constraints=[],
                requirements=["Optimize creativity"],
                context={'domain': domain},
                domain=domain,
                complexity=0.5
            )
            
            optimization_result = await self.creativity_optimizer.optimize_creativity_parameters(problem)
            
            # Update engine parameters
            optimized_params = optimization_result.get('optimized_parameters', {})
            self.creativity_level = optimized_params.get('creativity_level', self.creativity_level)
            self.innovation_bias = optimized_params.get('innovation_bias', self.innovation_bias)
            self.solution_count = optimized_params.get('solution_count', self.solution_count)
            
            logger.info(f"🩷 Optimized creativity settings for domain {domain}")
            return optimization_result
            
        except Exception as e:
            logger.error(f"🩷 Error optimizing creativity settings: {e}")
            return {}
    
    async def get_engine_status(self) -> EngineStatus:
        """
        Get comprehensive engine status
        """
        try:
            # Calculate metrics from generation history
            recent_generations = self.generation_history[-20:] if self.generation_history else []
            
            solutions_generated = sum(g.get('solutions_generated', 0) for g in recent_generations)
            
            avg_innovation_score = 0.8  # Default
            avg_creativity_score = 0.8  # Default
            breakthrough_candidates = 0
            
            if recent_generations:
                innovation_scores = [g.get('avg_innovation_score', 0.8) for g in recent_generations]
                creativity_scores = [g.get('avg_creativity_score', 0.8) for g in recent_generations]
                breakthrough_candidates = sum(g.get('breakthrough_candidates', 0) for g in recent_generations)
                
                avg_innovation_score = sum(innovation_scores) / len(innovation_scores)
                avg_creativity_score = sum(creativity_scores) / len(creativity_scores)
            
            # Get optimization metrics
            optimization_metrics = await self.creativity_optimizer.get_optimization_metrics()
            
            status = EngineStatus(
                status='active' if self.is_initialized else 'inactive',
                solutions_generated=solutions_generated,
                avg_innovation_score=avg_innovation_score,
                avg_creativity_score=avg_creativity_score,
                breakthrough_candidates=breakthrough_candidates,
                optimization_efficiency=optimization_metrics.adaptation_efficiency,
                learning_velocity=optimization_metrics.learning_velocity,
                last_activity=datetime.now()
            )
            
            return status
            
        except Exception as e:
            logger.error(f"🩷 Error getting engine status: {e}")
            return EngineStatus(
                status='error',
                solutions_generated=0,
                avg_innovation_score=0,
                avg_creativity_score=0,
                breakthrough_candidates=0,
                optimization_efficiency=0,
                learning_velocity=0,
                last_activity=None
            )
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get detailed performance metrics
        """
        try:
            # Get optimization metrics
            optimization_metrics = await self.creativity_optimizer.get_optimization_metrics()
            
            # Calculate generation metrics
            recent_generations = self.generation_history[-50:] if self.generation_history else []
            
            generation_metrics = {
                'total_generations': len(self.generation_history),
                'recent_generations': len(recent_generations),
                'avg_generation_time': 0.0,
                'avg_solutions_per_generation': 0.0,
                'breakthrough_rate': 0.0
            }
            
            if recent_generations:
                generation_times = [g.get('generation_time', 0) for g in recent_generations]
                solutions_counts = [g.get('solutions_generated', 0) for g in recent_generations]
                breakthrough_counts = [g.get('breakthrough_candidates', 0) for g in recent_generations]
                
                generation_metrics['avg_generation_time'] = sum(generation_times) / len(generation_times)
                generation_metrics['avg_solutions_per_generation'] = sum(solutions_counts) / len(solutions_counts)
                generation_metrics['breakthrough_rate'] = sum(breakthrough_counts) / sum(solutions_counts) if sum(solutions_counts) > 0 else 0
            
            # Combine all metrics
            performance_metrics = {
                'engine_uptime_seconds': (datetime.now() - self.start_time).total_seconds(),
                'optimization_metrics': {
                    'creativity_score': optimization_metrics.creativity_score,
                    'innovation_rate': optimization_metrics.innovation_rate,
                    'success_rate': optimization_metrics.success_rate,
                    'diversity_index': optimization_metrics.diversity_index,
                    'learning_velocity': optimization_metrics.learning_velocity,
                    'adaptation_efficiency': optimization_metrics.adaptation_efficiency,
                    'exploration_ratio': optimization_metrics.exploration_ratio
                },
                'generation_metrics': generation_metrics,
                'current_settings': {
                    'creativity_level': self.creativity_level,
                    'innovation_bias': self.innovation_bias,
                    'solution_count': self.solution_count,
                    'learning_rate': self.learning_rate
                }
            }
            
            return performance_metrics
            
        except Exception as e:
            logger.error(f"🩷 Error getting performance metrics: {e}")
            return {}
    
    def _estimate_complexity(self, description: str, requirements: List[str]) -> float:
        """Estimate problem complexity"""
        try:
            complexity_indicators = [
                'complex', 'advanced', 'sophisticated', 'intricate', 'challenging',
                'multi', 'distributed', 'scalable', 'enterprise', 'real-time'
            ]
            
            text = (description + ' ' + ' '.join(requirements)).lower()
            
            # Count complexity indicators
            complexity_count = sum(1 for indicator in complexity_indicators if indicator in text)
            
            # Base complexity from text length
            base_complexity = min(0.5, len(text) / 1000)
            
            # Requirement count factor
            requirement_factor = min(0.3, len(requirements) * 0.05)
            
            # Combine factors
            total_complexity = base_complexity + requirement_factor + (complexity_count * 0.1)
            
            return min(1.0, max(0.1, total_complexity))
            
        except Exception as e:
            logger.error(f"🩷 Error estimating complexity: {e}")
            return 0.5
    
    async def cleanup(self) -> None:
        """
        Cleanup engine resources
        """
        try:
            await self.solution_generator.cleanup()
            await self.innovation_engine.cleanup()
            await self.creativity_optimizer.cleanup()
            
            self.generation_history.clear()
            self.performance_metrics.clear()
            self.is_initialized = False
            
            logger.info("🩷 Creative Engine: Cleanup completed")
            
        except Exception as e:
            logger.error(f"🩷 Error during cleanup: {e}")

# Export main classes
__all__ = [
    'CreativeEngine',
    'SolutionGenerator',
    'InnovationEngine', 
    'CreativityOptimizer',
    'Solution',
    'Problem',
    'InnovationMetrics',
    'BreakthroughCandidate',
    'CreativityFeedback',
    'OptimizationMetrics',
    'EngineStatus'
]