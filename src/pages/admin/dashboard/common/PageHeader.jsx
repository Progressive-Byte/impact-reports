const PageHeader = ({ title, subtitle, action, heading: Tag = 'h2' }) => (
  <div className="flex items-start justify-between">
    <div>
      <Tag className="text-2xl font-black text-[#0B0D0F] tracking-tight">{title}</Tag>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
