import { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface DistanceMeasurementsProps {
  poolPoints: Point[];
  deckPoints?: Point[];
  showMeasurements: boolean;
}

export function DistanceMeasurements({
  poolPoints,
  deckPoints = [],
  showMeasurements,
}: DistanceMeasurementsProps) {
  const measurements = useMemo(() => {
    if (!showMeasurements || poolPoints.length < 2) return [];

    const measures: Array<{
      start: [number, number, number];
      end: [number, number, number];
      midpoint: [number, number, number];
      distance: number;
      label: string;
    }> = [];

    // Pool edge measurements
    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];

      const distance = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );

      const start: [number, number, number] = [p1.x, 0.5, p1.y];
      const end: [number, number, number] = [p2.x, 0.5, p2.y];
      const midpoint: [number, number, number] = [
        (p1.x + p2.x) / 2,
        0.8,
        (p1.y + p2.y) / 2,
      ];

      measures.push({
        start,
        end,
        midpoint,
        distance,
        label: `${distance.toFixed(2)} ft`,
      });
    }

    // Deck to pool edge measurements (if deck points exist)
    if (deckPoints.length > 0 && poolPoints.length > 0) {
      // Measure from each deck corner to nearest pool point
      deckPoints.forEach((deckPoint, idx) => {
        // Find nearest pool point
        let minDist = Infinity;
        let nearestPoolPoint = poolPoints[0];

        poolPoints.forEach((poolPoint) => {
          const dist = Math.sqrt(
            Math.pow(poolPoint.x - deckPoint.x, 2) +
              Math.pow(poolPoint.y - deckPoint.y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            nearestPoolPoint = poolPoint;
          }
        });

        if (minDist > 0.5 && idx % 2 === 0) {
          // Only show every other measurement to avoid clutter
          const start: [number, number, number] = [deckPoint.x, 0.5, deckPoint.y];
          const end: [number, number, number] = [
            nearestPoolPoint.x,
            0.5,
            nearestPoolPoint.y,
          ];
          const midpoint: [number, number, number] = [
            (deckPoint.x + nearestPoolPoint.x) / 2,
            0.8,
            (deckPoint.y + nearestPoolPoint.y) / 2,
          ];

          measures.push({
            start,
            end,
            midpoint,
            distance: minDist,
            label: `${minDist.toFixed(2)} ft`,
          });
        }
      });
    }

    return measures;
  }, [poolPoints, deckPoints, showMeasurements]);

  if (!showMeasurements) return null;

  return (
    <group>
      {measurements.map((measurement, idx) => (
        <group key={`measurement-${idx}`}>
          {/* Measurement line */}
          <Line
            points={[measurement.start, measurement.end]}
            color="#fbbf24"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />

          {/* Start marker */}
          <mesh position={measurement.start}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>

          {/* End marker */}
          <mesh position={measurement.end}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>

          {/* Distance label */}
          <Text
            position={measurement.midpoint}
            fontSize={0.4}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {measurement.label}
          </Text>
        </group>
      ))}
    </group>
  );
}
