export interface AgeCategory {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  hotelId: string;
}

export interface AgeCategoryDto {
  name: string;
  minAge: number;
  maxAge: number;
}
