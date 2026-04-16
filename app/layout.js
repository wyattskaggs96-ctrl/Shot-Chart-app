import './globals.css';

export const metadata = {
  title: 'Basketball Shot Chart Builder',
  description: 'Create a make/miss shot chart from uploaded video.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
