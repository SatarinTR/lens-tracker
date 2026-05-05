import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Arkada kalan o beyaz duvarı zorla siyah yapıyoruz */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { 
            background-color: #000000 !important; 
          }
        `}} />
        
        <ScrollViewStyleReset />
      </head>
      <body style={{ backgroundColor: '#000000' }}>{children}</body>
    </html>
  );
}