import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* İşte Apple'ın inadını kıran o sihirli kod */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}