import { useState } from 'react';
import { Header } from '@/components/Header';
import { IconCamera, IconCheck } from '@/components/icons';
import type { CarCategory } from '@/types';

const categoryOptions: CarCategory[] = ['JDM Legends', 'Drift', 'Tuner', 'Kei', 'GT'];

export function SellPage() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<CarCategory>('JDM Legends');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = brand.trim() && model.trim() && year.trim() && price.trim();

  if (submitted) {
    return (
      <div className="pb-28 px-5 pt-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent-line flex items-center justify-center">
          <IconCheck size={26} className="text-accent" />
        </div>
        <h2 className="font-display font-bold text-[20px] mt-5">Заявка отправлена</h2>
        <p className="text-[14px] text-ink-dim mt-2 max-w-xs">
          Модератор клуба проверит объявление и опубликует его в каталоге в течение дня.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setBrand('');
            setModel('');
            setYear('');
            setPrice('');
            setDescription('');
          }}
          className="mt-6 rounded-full bg-base-surface border border-base-line px-5 py-3 text-[14px] font-medium"
        >
          Разместить ещё одно
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <Header eyebrow="Разместить объявление" title="Продать авто" />

      <div className="px-5 space-y-4">
        <button className="w-full h-40 rounded-xl2 border border-dashed border-base-line bg-base-surface flex flex-col items-center justify-center gap-2 text-ink-faint">
          <IconCamera size={22} />
          <span className="text-[13px]">Добавить фотографии</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Марка" value={brand} onChange={setBrand} placeholder="Nissan" />
          <Field label="Модель" value={model} onChange={setModel} placeholder="Skyline GT-R" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Год" value={year} onChange={setYear} placeholder="1999" numeric />
          <Field label="Цена, $" value={price} onChange={setPrice} placeholder="145000" numeric />
        </div>

        <div>
          <div className="text-[13px] text-ink-dim mb-2">Категория</div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-soft border-accent-line text-ink'
                      : 'bg-base-surface border-base-line text-ink-dim'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[13px] text-ink-dim mb-2">Описание</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Комплектация, история обслуживания, особенности..."
            className="w-full rounded-xl2 bg-base-surface border border-base-line px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors resize-none"
          />
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 z-30 px-5" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}>
        <div className="glass-shell rounded-xl2 p-4 shadow-card">
          <button
            disabled={!canSubmit}
            onClick={() => setSubmitted(true)}
            className="w-full rounded-full bg-ink text-base font-semibold text-[14px] py-3.5 disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            Отправить на модерацию
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
}

function Field({ label, value, onChange, placeholder, numeric }: FieldProps) {
  return (
    <div>
      <div className="text-[13px] text-ink-dim mb-2">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={numeric ? 'numeric' : 'text'}
        className="w-full rounded-xl2 bg-base-surface border border-base-line px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors"
      />
    </div>
  );
}
