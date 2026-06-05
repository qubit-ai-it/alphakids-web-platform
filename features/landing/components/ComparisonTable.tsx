import { comparisonRows } from '@/features/landing/data/content';

function CheckIcon() {
  return (
    <span className="material-symbols-outlined text-[22px] text-green-500">check_circle</span>
  );
}

function CrossIcon() {
  return (
    <span className="material-symbols-outlined text-[22px] text-secondary-400">cancel</span>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <CrossIcon />;
  return <span className="text-[14px] font-semibold text-secondary-900">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <section id="comparison" className="py-[80px] md:py-[100px] bg-secondary-50">
      <div className="max-w-[1100px] mx-auto px-[24px]">
        <div className="text-center mb-[60px]">
          <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
            ¿Por qué AlphaKids?
          </h2>
          <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[600px] mx-auto">
            Compará con otras plataformas educativas.
          </p>
        </div>

        {/* ─── Desktop: <table> ─── */}
        <div className="hidden md:block">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Característica</th>
                  <th className="table-header-cell text-center">
                    <span className="font-extrabold text-primary-600">AlphaKids</span>
                  </th>
                  <th className="table-header-cell text-center">Khan Academy Kids</th>
                  <th className="table-header-cell text-center">Duolingo ABC</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.criteria} className="table-row">
                    <td className="table-cell font-medium text-secondary-900">
                      {row.criteria}
                    </td>
                    <td className="table-cell text-center">
                      <CellValue value={row.alphaKids} />
                    </td>
                    <td className="table-cell text-center">
                      <CellValue value={row.khanAcademy} />
                    </td>
                    <td className="table-cell text-center">
                      <CellValue value={row.duolingoAbc} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Mobile: card layout ─── */}
        <div className="md:hidden space-y-[16px]">
          {comparisonRows.map((row) => (
            <div key={row.criteria} className="card">
              <p className="text-[15px] font-bold text-secondary-900 mb-[12px]">
                {row.criteria}
              </p>
              <div className="space-y-[8px]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-primary-600">AlphaKids</span>
                  <CellValue value={row.alphaKids} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-secondary-600">Khan Academy Kids</span>
                  <CellValue value={row.khanAcademy} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-secondary-600">Duolingo ABC</span>
                  <CellValue value={row.duolingoAbc} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
