declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.glsl' {
  const value: string;
  export default value;
}

type FixedLengthArray<L> = Array<number> & { length: L; };

type FixedLengthNumberArray<T, L> = [T, ...T[]] & { length: L; };
type Matrix4 = FixedLengthNumberArray<number, 16>;
type Matrix3 = FixedLengthNumberArray<number, 9>;
type Vector3 = FixedLengthNumberArray<number, 3>;
type Vector4 = FixedLengthNumberArray<number, 4>;

type RgbaColor = [number, number, number, number];
