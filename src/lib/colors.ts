export type ColorTheme = {
  id: string;
  name: string;
  bg: string;
  text: string;
};

export const COLOR_THEMES: Record<string, ColorTheme> = {
  '01': { id: '01', name: 'デフォルト（黄）', bg: '#FFD600', text: '#1A1A1A' },
  '02': { id: '02', name: 'ブラック', bg: '#1A1A1A', text: '#FFFFFF' },
  '03': { id: '03', name: 'グレー', bg: '#757575', text: '#FFFFFF' },
  '04': { id: '04', name: 'ホワイト', bg: '#F8F9FA', text: '#1A1A1A' },
  '05': { id: '05', name: 'レッド', bg: '#E53935', text: '#FFFFFF' },
  '06': { id: '06', name: 'ピンク', bg: '#F48FB1', text: '#1A1A1A' },
  '07': { id: '07', name: 'ブルー', bg: '#1E88E5', text: '#FFFFFF' },
  '08': { id: '08', name: 'ライトブルー', bg: '#81D4FA', text: '#1A1A1A' },
  '09': { id: '09', name: 'グリーン', bg: '#43A047', text: '#FFFFFF' },
  '10': { id: '10', name: 'ライトグリーン', bg: '#A5D6A7', text: '#1A1A1A' },
  '11': { id: '11', name: 'ブラウン', bg: '#6D4C41', text: '#FFFFFF' },
  '12': { id: '12', name: 'ベージュ', bg: '#D7CCC8', text: '#1A1A1A' },
};

export const COLOR_THEMES_ORDER = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
];
