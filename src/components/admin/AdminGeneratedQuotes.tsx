import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck2 } from 'lucide-react';
import { generatedQuotes } from '@/data/generatedQuotes';

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

// Generated Quotes — quotes produced with the platform quote tool for
// homeowner packages, filed by the Pool Quotes lane. Data-file backed
// (src/data/generatedQuotes.ts); the PDFs live with the lane's records.
const AdminGeneratedQuotes = () => {
  return (
    <Card className="border border-neutral-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <FileCheck2 className="h-5 w-5 text-black" />
          Generated Quotes
        </CardTitle>
        <CardDescription className="text-neutral-600">
          Quotes generated with the quote tool for homeowner packages, newest first. Every quote carries a finish, a heater and pavers at least 3 feet around the pool.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-black">
            <thead>
              <tr className="border-b border-neutral-200 text-left">
                <th className="py-2 pr-4 font-semibold">Customer</th>
                <th className="py-2 pr-4 font-semibold">Pool</th>
                <th className="py-2 pr-4 font-semibold">Added features</th>
                <th className="py-2 pr-4 font-semibold">Total</th>
                <th className="py-2 pr-4 font-semibold">Date</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {generatedQuotes.map((q) => (
                <tr key={q.id} className="border-b border-neutral-100 align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{q.customer}</div>
                    <div className="text-neutral-500">{q.location}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium">{q.model}</div>
                    <div className="text-neutral-500">{q.construction} · {q.dimensions} · base {money(q.basePrice)}</div>
                  </td>
                  <td className="py-3 pr-4">
                    {q.features.map((f) => (
                      <div key={f.name} className="text-neutral-700">
                        {f.name} — {f.price > 0 ? `+${money(f.price)}` : 'included'}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 pr-4 font-semibold">{money(q.totalInvestment)}</td>
                  <td className="py-3 pr-4">{q.quoteDate}</td>
                  <td className="py-3 text-neutral-700">{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          {generatedQuotes.length} quotes filed. PDF files are held with the package records; new quotes are appended to the data file as they are generated.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminGeneratedQuotes;
