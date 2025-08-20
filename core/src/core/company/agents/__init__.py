"""
Company Agents Module

This module contains all the specialized AI agents that comprise Scafoldr Inc.
Each agent has specific expertise and responsibilities within the development process.
"""

from .base_agent import BaseCompanyAgent, AgentResponse
from .architect import SoftwareArchitect

__all__ = ["BaseCompanyAgent", "AgentResponse", "SoftwareArchitect"]