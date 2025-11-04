import { render, screen, within } from '@testing-library/react';
import React from 'react';
import MapDemo, { DemoMarker } from '../components/MapDemo';

describe('MapDemo', () => {
  it('renders markers list with labels and coordinates', () => {
    const markers: DemoMarker[] = [
      { id: 'a', label: 'Alpha', position: { lat: 51.5, lng: -0.12 } },
      { id: 'b', label: 'Beta', position: { lat: 40.71, lng: -74.0 } },
    ];

    render(
      <MapDemo
        title="Test Map"
        center={{ lat: 10, lng: 20 }}
        zoom={5}
        markers={markers}
        enableInteraction={false}
      />,
    );

    // Header elements
    expect(screen.getByText('Test Map')).toBeInTheDocument();
    expect(screen.getByText(/zoom 5/)).toBeInTheDocument();
    expect(screen.getByText(/center 10.000, 20.000/)).toBeInTheDocument();

    // Markers section shows correct count
    expect(screen.getByText(/Markers \(2\)/)).toBeInTheDocument();

    // Each marker row renders label and coordinates
    expect(screen.getByText(/Alpha → 51.500, -0.120/)).toBeInTheDocument();
    expect(screen.getByText(/Beta → 40.710, -74.000/)).toBeInTheDocument();

    // When interaction disabled, no "Click" hints are shown
    const rows = screen.getAllByText(/→/);
    rows.forEach((row) => {
      const utils = within(row.parentElement as HTMLElement);
      expect(utils.queryByText('Click')).not.toBeInTheDocument();
    });
  });
});
