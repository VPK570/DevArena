"use client";

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#131316] text-[#B3B7CF] font-headline">
      INITIALIZING_EDITOR...
    </div>
  )
});

export default function MonacoEditor({ value, onChange }) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 scanline z-10 opacity-[0.03] pointer-events-none"></div>
      <Editor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'on',
          lineHeight: 24,
          automaticLayout: true,
          backgroundColor: '#131316',
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('cyberpunk', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#131316',
            }
          });
        }}
      />
    </div>
  );
}
