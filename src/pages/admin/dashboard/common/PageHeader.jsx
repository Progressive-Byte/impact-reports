const PageHeader = ({ title, subtitle, action, heading: Tag = 'h2' }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
    <div className="min-w-0">
      <Tag className="text-2xl font-black text-[#0B0D0F] tracking-tight">{title}</Tag>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
