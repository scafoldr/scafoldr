export interface IPoint {
  x: number;
  y: number;
}

export interface IColumn {
  id: string;
  name: string;
  dataType: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  index: number;
}

export interface ITable {
  id: string;
  name: string;
  columns: IColumn[];
  position: IPoint;
  width: number;
  height: number;
}

export type RelationshipType = 'OneToOne' | 'OneToMany' | 'ManyToMany';

export interface IRelationship {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
}

export interface IERDiagram {
  tables: ITable[];
  relationships: IRelationship[];
}