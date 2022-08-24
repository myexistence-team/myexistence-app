const tintColorLight = '#4684E7';
const tintColorDark = '#fff';

const tints: any = {
  red: '#FB7D7D',
  blue: '#4684E7',
  blues: {
    blue1: "#6295E7",
    blue2: "#4684E7",
    blue3: "#3466E7",
    blue4: "#213A95",
  },
  yellow: "#FFE872",
  yellows: {
    yellow1: "#FFF38A",
    yellow2: "#FFE872",
    yellow3: "#FFDE67",
    yellow4: "#D4A549" ,
  },
  grey: "#8EA5C9",
  orange: "#FFAE34",
  green: "#93E291",
  black: "#333333",

}

export default {
  light: {
    text: '#333333',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    ...tints,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    ...tints,
  },
};
