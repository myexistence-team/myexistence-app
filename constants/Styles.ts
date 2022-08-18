import { StyleSheet } from "react-native";

const headerFontFamily = 'quicksand';
const bodyFontFamily = 'manrope';
export const textStyles = StyleSheet.create({
  heading1: {
    fontSize: 64,
    fontFamily: headerFontFamily,
    fontWeight: "700",
  },
  heading2: {
    fontSize: 48,
    fontFamily: headerFontFamily,
    fontWeight: "700",
  },
  heading3: {
    fontSize: 30,
    fontFamily: headerFontFamily,
    fontWeight: "700",
  },
  heading4: {
    fontSize: 24,
    fontFamily: headerFontFamily,
    fontWeight: "700",
  },
  heading5: {
    fontSize: 18,
    fontFamily: headerFontFamily,
    fontWeight: "700",
  },
  body1: {
    fontSize: 18,
    fontFamily: bodyFontFamily,
  },
  body2: {
    fontSize: 14,
    fontFamily: bodyFontFamily,
  },
  body3: {
    fontSize: 12,
    fontFamily: bodyFontFamily,
  },
  buttonLg: {
    fontSize: 24,
    fontFamily: bodyFontFamily,
    fontWeight: "500",
  },
  buttonMd: {
    fontSize: 18,
    fontFamily: bodyFontFamily,
    fontWeight: "500",
  },
  buttonSm: {
    fontSize: 14,
    fontFamily: bodyFontFamily,
    fontWeight: "500",
  },
})