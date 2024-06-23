export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789'
    let result = ''
    for (let i = 0; i < integerLength; i++) {
      result += characters[Math.floor(Math.random() * characters.length)]
    }
    return parseInt(result, 10)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJson(prop: string): any {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
    return JSON.parse(prop);
  }
}
