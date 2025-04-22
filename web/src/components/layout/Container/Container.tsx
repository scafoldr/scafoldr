import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => (
  <div className="mx-auto max-w-screen-xl">{children}</div>
);

export default Container;
