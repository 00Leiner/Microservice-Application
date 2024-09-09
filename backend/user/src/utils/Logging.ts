import kleur from "kleur";

export default class Logging {
  public static info = (args: any) =>
    console.log(
      kleur.blue(`[${new Date().toLocaleString()}] [INFO]`),
      typeof args === "string" ? kleur.blue(args) : args
    );
  public static warn = (args: any) =>
    console.log(
      kleur.yellow(`[${new Date().toLocaleString()}] [WARN]`),
      typeof args === "string" ? kleur.yellow(args) : args
    );
  public static error = (args: any) =>
    console.log(
      kleur.red(`[${new Date().toLocaleString()}] [ERROR]`),
      typeof args === "string" ? kleur.red(args) : args
    );
}
