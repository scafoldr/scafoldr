import {
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiPython,
  SiSpringboot
} from '@icons-pack/react-simple-icons';
import { Template } from '../types/template';

export const TEMPLATES: Template[] = [
  {
    id: 'next-js-typescript',
    name: 'Next.js + Drizzle',
    description: 'A Next.js application using TypeScript and Drizzle.',
    Icon: <SiNextdotjs size="100%" />
  },
  {
    id: 'nodejs-express-js',
    name: 'Node.js + Express',
    description: 'A basic Node.js application using the Express framework.',
    Icon: <SiNodedotjs size="100%" />
  },
  {
    id: 'java-spring',
    name: 'Java + Spring Boot',
    description: 'A Java application using the Spring Boot framework.',
    Icon: <SiSpringboot size="100%" />
  },
  {
    id: 'php-laravel',
    name: 'PHP + Laravel',
    description: 'A PHP application using the Laravel framework.',
    Icon: <SiPhp size="100%" />,
    comingSoon: true
  },
  {
    id: 'python-fastapi',
    name: 'Python + FastAPI',
    description: 'A Python application using the FastAPI framework.',
    Icon: <SiPython size="100%" />,
    comingSoon: true
  }
];
