import React, { useState, useEffect, useRef } from 'react';

const GraphVisualizer = ({ functionType = 'linear' }) => {
  const canvasRef = useRef(null);
  const [parameters, setParameters] = useState({
    a: 1,
    b: 0,
    c: 0
  });

  const updateParameter = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: parseFloat(value)
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Set up coordinate system
    context.translate(width / 2, height / 2); // Origin at center
    const scale = 20; // 20 pixels per unit

    // Draw axes
    context.beginPath();
    context.strokeStyle = '#ccc';
    context.lineWidth = 1;
    // x-axis
    context.moveTo(-width / 2, 0);
    context.lineTo(width / 2, 0);
    // y-axis
    context.moveTo(0, -height / 2);
    context.lineTo(0, height / 2);
    context.stroke();

    // Draw grid lines
    context.beginPath();
    context.strokeStyle = '#eee';
    context.lineWidth = 0.5;
    for (let i = -width / 2; i <= width / 2; i += scale) {
      if (i === 0) continue; // Skip the origin
      context.moveTo(i, -height / 2);
      context.lineTo(i, height / 2);
    }
    for (let i = -height / 2; i <= height / 2; i += scale) {
      if (i === 0) continue; // Skip the origin
      context.moveTo(-width / 2, i);
      context.lineTo(width / 2, i);
    }
    context.stroke();

    // Plot function
    context.beginPath();
    context.strokeStyle = '#3b82f6'; // Blue
    context.lineWidth = 2;

    const plotPoints = [];
    const { a, b, c } = parameters;

    for (let x = -width / (2 * scale); x <= width / (2 * scale); x += 0.1) {
      let y;
      switch (functionType) {
        case 'quadratic':
          y = a * x * x + b * x + c;
          break;
        case 'exponential':
          y = a * Math.pow(b, x) + c;
          break;
        case 'linear':
        default:
          y = a * x + b;
          break;
      }

      const pixelX = x * scale;
      const pixelY = -y * scale; // Negate because canvas y-axis is flipped

      if (pixelY >= -height / 2 && pixelY <= height / 2) {
        if (plotPoints.length === 0) {
          context.moveTo(pixelX, pixelY);
        } else {
          context.lineTo(pixelX, pixelY);
        }
        plotPoints.push({ x: pixelX, y: pixelY });
      }
    }

    context.stroke();

    // Reset transformation
    context.setTransform(1, 0, 0, 1, 0, 0);
  }, [parameters, functionType]);

  // Determine which parameters to show based on function type
  const renderParameters = () => {
    switch (functionType) {
      case 'quadratic':
        return (
          <>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">a (koefisien x²)</label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={parameters.a}
                onChange={(e) => updateParameter('a', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.a}</div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">b (koefisien x)</label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={parameters.b}
                onChange={(e) => updateParameter('b', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.b}</div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">c (konstanta)</label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={parameters.c}
                onChange={(e) => updateParameter('c', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.c}</div>
            </div>
            <div className="mt-2 text-center font-medium">
              f(x) = {parameters.a}x² {parameters.b >= 0 ? '+' : ''} {parameters.b}x {parameters.c >= 0 ? '+' : ''} {parameters.c}
            </div>
          </>
        );
      case 'exponential':
        return (
          <>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">a (amplitudo)</label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={parameters.a}
                onChange={(e) => updateParameter('a', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.a}</div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">b (basis)</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={parameters.b}
                onChange={(e) => updateParameter('b', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.b}</div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">c (pergeseran)</label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={parameters.c}
                onChange={(e) => updateParameter('c', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.c}</div>
            </div>
            <div className="mt-2 text-center font-medium">
              f(x) = {parameters.a} × {parameters.b}<sup>x</sup> {parameters.c >= 0 ? '+' : ''} {parameters.c}
            </div>
          </>
        );
      case 'linear':
      default:
        return (
          <>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">a (kemiringan/gradien)</label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={parameters.a}
                onChange={(e) => updateParameter('a', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.a}</div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">b (konstanta)</label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={parameters.b}
                onChange={(e) => updateParameter('b', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{parameters.b}</div>
            </div>
            <div className="mt-2 text-center font-medium">
              f(x) = {parameters.a}x {parameters.b >= 0 ? '+' : ''} {parameters.b}
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3">
          <div className="border rounded-lg p-2 bg-gray-50">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={300} 
              className="bg-white w-full h-auto"
            ></canvas>
          </div>
        </div>
        <div className="md:w-1/3">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-center">Parameter</h3>
            {renderParameters()}
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Geser slider untuk melihat perubahan pada grafik
      </div>
    </div>
  );
};

export default GraphVisualizer; 