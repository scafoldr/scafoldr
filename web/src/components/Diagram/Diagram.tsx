// components/Diagram.tsx
'use client';

import { Stage, Layer, Rect, Text } from 'react-konva';

const Diagram = ({ dbml }: { dbml: string }) => {
  // Define dimensions matching your HTML snippet
  const stageWidth = 905;
  const stageHeight = 1300;

  return (
    <div
      tabIndex={0}
      className="diagram"
      style={{
        backgroundColor: 'rgb(68, 68, 76)', // dark background as provided
        cursor: 'default',
        width: `${stageWidth}px`,
        height: `${stageHeight}px`
      }}>
      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          {/* Example shape: A draggable white rectangle with text */}
          <Rect
            x={50}
            y={50}
            width={200}
            height={100}
            fill="white"
            stroke="#2b6cb0"
            strokeWidth={2}
            draggable
          />
          <Text text="Drag me!" x={60} y={70} fontSize={16} fill="black" />
        </Layer>
      </Stage>
    </div>
  );
};

export default Diagram;
