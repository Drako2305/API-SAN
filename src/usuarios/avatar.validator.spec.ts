import { AVATAR_DATA_MAX, esAvatarValido } from './avatar.validator';

describe('esAvatarValido', () => {
  it('acepta enlaces http(s)', () => {
    expect(esAvatarValido('https://ejemplo.com/ana.png')).toBe(true);
  });

  it('acepta una imagen pequena en data URL', () => {
    expect(esAvatarValido('data:image/webp;base64,UklGRhAAAABXRUJQ')).toBe(
      true,
    );
  });

  it('rechaza texto libre, otros tipos y data URL demasiado grandes', () => {
    expect(esAvatarValido('no-es-url')).toBe(false);
    expect(esAvatarValido('data:text/html;base64,PGI+')).toBe(false);
    expect(esAvatarValido('javascript:alert(1)')).toBe(false);
    expect(
      esAvatarValido(`data:image/png;base64,${'A'.repeat(AVATAR_DATA_MAX)}`),
    ).toBe(false);
    expect(esAvatarValido(`https://e.co/${'a'.repeat(260)}`)).toBe(false);
  });
});
