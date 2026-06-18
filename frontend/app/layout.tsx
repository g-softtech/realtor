import './globals.css';

export const metadata = {
  title: 'Cortex RealtyEngine',
  description: 'A modern real estate web platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  );
}