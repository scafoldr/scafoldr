import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => (
  <div className="mx-auto max-w-screen-lg px-3 md:px-0">{children}</div>
);

export default Container;
