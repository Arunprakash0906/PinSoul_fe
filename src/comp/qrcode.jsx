import { QRCodeSVG } from 'qrcode.react';

export default function LocationQRCode({ value, title }) {
  return (
    <div className="location-qr-code">
      <QRCodeSVG value={value} size={180} level="H" includeMargin title={title} />
    </div>
  );
}
