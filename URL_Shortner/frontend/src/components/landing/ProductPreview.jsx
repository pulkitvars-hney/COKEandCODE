const metrics = [
  ['2,841', 'clicks this week'],
  ['18', 'countries reached'],
  ['7 days', 'link lifetime'],
]

export default function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Shortly dashboard preview">
      <div className="product-preview__bar">
        <span className="product-preview__mark">s</span>
        <span>Link studio</span>
        <span className="product-preview__status">Live</span>
      </div>
      <div className="product-preview__body">
        <div className="product-preview__headline">
          <div><p>Good morning, creator</p><strong>Your links are moving.</strong></div>
          <button type="button" tabIndex={-1}>+ New link</button>
        </div>
        <div className="product-preview__metrics">
          {metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
        <div className="product-preview__link">
          <span className="product-preview__favicon">L</span>
          <div><strong>shortly.dev/launch</strong><span>your-brand.com/spring-launch</span></div>
          <span className="product-preview__clicks">1,204 clicks</span>
        </div>
        <div className="product-preview__chart" aria-hidden="true">
          {[36, 55, 43, 70, 61, 88, 78, 100, 84, 92, 72, 96].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
        </div>
      </div>
    </div>
  )
}
