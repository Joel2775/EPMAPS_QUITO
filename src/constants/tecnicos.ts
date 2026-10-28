export type Technician = {
  code: string;
  password: string;
  name: string;
};

export const TECHNICIANS: Technician[] = [
  { code: "TEC-001", password: "1234", name: "Técnico Uno" },
  { code: "TEC-002", password: "5678", name: "Técnico Dos" },
];
