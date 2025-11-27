import { useEffect, useRef, useState } from 'react';
import { Viewer, Entity, EntityDescription, PointGraphics, LabelGraphics, CameraFlyTo } from 'resium';
import { Cartesian3, Color, Ion, createWorldTerrainAsync } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Set Cesium Ion token (you can use the default one or get your own)
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

interface VisitorLocation {
  id: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  device_type?: string;
  count: number;
}

interface GlobeVisualizationProps {
  locations: VisitorLocation[];
}

export const GlobeVisualization = ({ locations }: GlobeVisualizationProps) => {
  const viewerRef = useRef<any>(null);
  const [terrainProvider, setTerrainProvider] = useState<any>(null);

  useEffect(() => {
    createWorldTerrainAsync().then((terrain) => {
      setTerrainProvider(terrain);
    });
  }, []);

  const getColorByCount = (count: number): Color => {
    if (count > 50) return Color.fromCssColorString('#00ff00'); // Bright green
    if (count > 20) return Color.fromCssColorString('#00cc00'); // Medium green
    if (count > 10) return Color.fromCssColorString('#009900'); // Dark green
    return Color.fromCssColorString('#006600'); // Very dark green
  };

  const getPixelSizeByCount = (count: number): number => {
    return Math.min(30, Math.max(8, count / 2));
  };

  return (
    <div className="w-full h-full relative">
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={terrainProvider}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#000',
        }}
      >
        <CameraFlyTo
          destination={Cartesian3.fromDegrees(0, 20, 20000000)}
          duration={2}
        />
        
        {locations.map((location) => (
          <Entity
            key={location.id}
            position={Cartesian3.fromDegrees(location.longitude, location.latitude)}
            description={`
              <div style="font-family: monospace; color: #0f0; background: #000; padding: 10px; border: 1px solid #0f0;">
                <h3 style="color: #0f0; margin: 0 0 10px 0;">${location.city || 'Unknown'}, ${location.country || 'Unknown'}</h3>
                <p style="margin: 5px 0;"><strong>VISITORS:</strong> ${location.count}</p>
                <p style="margin: 5px 0;"><strong>DEVICE:</strong> ${location.device_type || 'Unknown'}</p>
                <p style="margin: 5px 0;"><strong>COORDS:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
              </div>
            `}
          >
            <PointGraphics
              pixelSize={getPixelSizeByCount(location.count)}
              color={getColorByCount(location.count)}
              outlineColor={Color.fromCssColorString('#00ff00')}
              outlineWidth={2}
            />
            <LabelGraphics
              text={`${location.count}`}
              font="14px monospace"
              fillColor={Color.fromCssColorString('#00ff00')}
              outlineColor={Color.fromCssColorString('#000000')}
              outlineWidth={3}
              style={1}
              verticalOrigin={1}
              pixelOffset={new Cartesian3(0, -20, 0)}
              scale={0.8}
            />
          </Entity>
        ))}
      </Viewer>
    </div>
  );
};
