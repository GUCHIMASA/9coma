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
  // 9TUBE用
  '作業用ＢＧＭ特選編': 'linear-gradient(135deg, #ff416c, #ff4b2b)',
  '憧れのルーティン編': 'linear-gradient(135deg, #f7971e, #ffd200)',
  '伝説の実況神回編': 'linear-gradient(135deg, #00c6ff, #0072ff)',
  '至高のＭＶ選抜編': 'linear-gradient(135deg, #8e2de2, #4a00e0)',
  '爆笑ショート動画編': 'linear-gradient(135deg, #f85032, #e73827)',
  '至高の講義教養編': 'linear-gradient(135deg, #3a7bd5, #3a6073)',
  '最先端ＡＩ活用術編': 'linear-gradient(135deg, #0575e6, #021b79)',
  '究極の没入ASMR編': 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
  'Vtuber神回選抜編': 'linear-gradient(135deg, #ff00cc, #333399)',
  '至福の癒やし動物編': 'linear-gradient(135deg, #11998e, #38ef7d)',
};
