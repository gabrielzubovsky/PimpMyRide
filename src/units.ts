// The 3D scene works in metres. Real parts are specified in millimetres and
// inches, so convert at the edge and keep the specs in their native units.

export const MM = 0.001;
export const INCH = 0.0254;

export const mm = (value: number) => value * MM;
export const inch = (value: number) => value * INCH;
