import React from 'react';
import { Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';
import { isMobile } from '../../utils/mobile';

const { Option } = Select;

const languages = [
  { code: 'zh-CN', name: '中文', nativeName: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }, // 新增阿拉伯语
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const mobile = isMobile();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    // 更新HTML lang和dir属性
    document.documentElement.lang = value;
    document.documentElement.dir = value.startsWith('ar') ? 'rtl' : 'ltr';
    // 保存到localStorage
    localStorage.setItem('i18nextLng', value);
  };

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Tooltip title={mobile ? '' : '选择语言 / Select Language'}>
      <Select
        value={i18n.language}
        onChange={handleChange}
        style={{ width: mobile ? 100 : 140 }}
        size={mobile ? 'small' : 'middle'}
        suffixIcon={<GlobalOutlined />}
      >
        {languages.map((lang) => (
          <Option key={lang.code} value={lang.code}>
            <span style={{ marginRight: 8 }}>{lang.flag}</span>
            <span>{lang.nativeName}</span>
            {!mobile && lang.name !== lang.nativeName && (
              <span style={{ color: '#999', marginLeft: 4, fontSize: '12px' }}>
                ({lang.name})
              </span>
            )}
          </Option>
        ))}
      </Select>
    </Tooltip>
  );
};
