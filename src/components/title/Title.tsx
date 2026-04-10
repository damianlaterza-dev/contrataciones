type Title = {
  title: string;
  subtitle?: string;
};

export default function Title({ title, subtitle }: Title) {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      {subtitle && <p className="2xl:text-lg mt-2">{subtitle}</p>}
    </>
  );
}
