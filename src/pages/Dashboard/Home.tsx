import PageMeta from "../../components/common/PageMeta";
import TableCastigadosAll from "../../components/tables/BasicTables/TableCastigadosAll";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Cartera Castigada | COOPSERP"
        description="Gestión de asociados castigados"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <TableCastigadosAll />
        </div>
      </div>
    </>
  );
}
