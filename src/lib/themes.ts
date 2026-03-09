// テーマの選択肢と対応するグラデーションの定義
export const THEME_OPTIONS = [
  '人生のバイブル編',
  '涙腺崩壊・感涙編',
  '腹筋崩壊・爆笑編',
  'メンタル浄化編',
  'あの頃（青春）編',
  '大人で刺さった編',
  '今これ激アツ！編',
  '原点にして頂点編',
  '布教用ガチ推し編',
  '画力に溺れる編'
] as const;

export type ThemeType = typeof THEME_OPTIONS[number];

export const THEME_GRADIENTS: Record<string, string> = {
  '人生のバイブル編': 'linear-gradient(135deg, #001f3f, #003366)',
  '涙腺崩壊・感涙編': 'linear-gradient(135deg, #4facfe, #00f2fe)', // 明るすぎた水色系を少し濃く深く調整
  '腹筋崩壊・爆笑編': 'linear-gradient(135deg, #ff0844, #ffb199)', // 明るすぎたピンク系を少し濃くビビッドに調整
  'メンタル浄化編': 'linear-gradient(135deg, #00b09b, #96c93d)',
  'あの頃（青春）編': 'linear-gradient(135deg, #89f7fe, #66a6ff)', 
  '大人で刺さった編': 'linear-gradient(135deg, #4b0082, #000000)',
  '今これ激アツ！編': 'linear-gradient(135deg, #f83600, #f9d423)', 
  '原点にして頂点編': 'linear-gradient(135deg, #232526, #414345)',
  '布教用ガチ推し編': 'linear-gradient(135deg, #ff0080, #ff8c00)',
  '画力に溺れる編': 'linear-gradient(135deg, #667eea, #764ba2)', // 明るすぎた白/グレー系を、上品なパープルブルー系に調整
};
