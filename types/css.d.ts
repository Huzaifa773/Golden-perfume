// types/css.d.ts
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "sweetalert2/dist/sweetalert2.min.css";