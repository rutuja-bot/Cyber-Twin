import React from 'react';

declare module '../../visualization/InvestigationView' {
  export interface InvestigationViewProps {
    model: any;
    initialEventId?: string | null;
    initialAttackPathOnly?: boolean;
    onEventSelect?: (event: any) => void;
    onNodeSelect?: (node: any) => void;
    onEdgeSelect?: (edge: any) => void;
    height?: string | number;
    width?: string | number;
  }
  export const InvestigationView: React.FC<InvestigationViewProps>;
}

declare module '../../visualization/RelationshipGraph' {
  export interface RelationshipGraphProps {
    model: any;
    selectedEventId?: string | null;
    onNodeSelect?: (node: any) => void;
    onEdgeSelect?: (edge: any) => void;
    onSelectionClear?: () => void;
    layoutName?: string;
    height?: string | number;
    width?: string | number;
    attackPathOnly?: boolean;
    attackPathNodeIds?: string[] | null;
    attackPathEdgeIds?: string[] | null;
  }
  export const RelationshipGraph: React.FC<RelationshipGraphProps>;
}

declare module '../../visualization/CyberTwin3DView' {
  export interface CyberTwin3DViewProps {
    model: any;
    selectedEventId?: string | null;
    attackPathOnly?: boolean;
    attackPathNodeIds?: string[] | null;
    attackPathEdgeIds?: string[] | null;
    onNodeSelect?: (node: any) => void;
    height?: string | number;
    width?: string | number;
  }
  export const CyberTwin3DView: React.FC<CyberTwin3DViewProps>;
}

declare module '../../visualization/IncidentTimeline' {
  export interface IncidentTimelineProps {
    model: any;
    selectedEventId?: string | null;
    onEventSelect?: (event: any) => void;
    height?: string | number;
    width?: string | number;
    attackPathOnly?: boolean;
  }
  export const IncidentTimeline: React.FC<IncidentTimelineProps>;
  export function formatEventType(type: string): string;
}

declare module '../../visualization' {
  export const mockEvents: any;
  export function createCyberTwinDataModel(input: any): any;
  export function createModelFromReconstruction(reconstruction: any): any;
  export const InvestigationView: React.FC<any>;
  export const RelationshipGraph: React.FC<any>;
  export const CyberTwin3DView: React.FC<any>;
  export const IncidentTimeline: React.FC<any>;
}

declare module '../visualization' {
  export const mockEvents: any;
  export function createCyberTwinDataModel(input: any): any;
  export function createModelFromReconstruction(reconstruction: any): any;
  export const InvestigationView: React.FC<any>;
  export const RelationshipGraph: React.FC<any>;
  export const CyberTwin3DView: React.FC<any>;
  export const IncidentTimeline: React.FC<any>;
}

declare module 'three' {
  const content: any;
  export = content;
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export class GLTFLoader {
    constructor();
    load(
      url: string,
      onLoad: (gltf: any) => void,
      onProgress?: (event: any) => void,
      onError?: (event: any) => void
    ): void;
  }
}
