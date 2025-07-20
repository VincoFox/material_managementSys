import { useEffect, useRef } from 'react';
import { createJSONEditor } from 'vanilla-jsoneditor';

const Editor = ({
  defaultValue,
  onChange,
}: {
  defaultValue: any;
  onChange?: (value: object, error?: any) => void;
}) => {
  const editorRef = useRef<any>(null);
  const domRef = useRef<HTMLDivElement>(null);
  const handleChange = (value: object, error?: any) => {
    onChange?.(value, error);
  };

  useEffect(() => {
    if (domRef.current && !editorRef.current) {
      editorRef.current = createJSONEditor({
        target: domRef.current,
        props: {
          content: {
            json: defaultValue,
          },
          onChange: (
            updatedContent: { json: object; text: string },
            previousContent: { json: object; text: string },
            {
              contentErrors,
              patchResult,
            }: {
              contentErrors: any;
              patchResult: any;
            }
          ) => {
            console.log('onChange', {
              updatedContent,
              previousContent,
              contentErrors,
              patchResult,
            });
            if (contentErrors) {
              handleChange(updatedContent.json, true);
            } else {
              try {
                const newData = updatedContent.json
                  ? updatedContent.json
                  : JSON.parse(updatedContent.text);
                handleChange(newData);
              } catch (e) {
                handleChange(updatedContent.text as any);
                return;
              }
            }
          },
        },
      });
    }
  }, []);

  return <div className='h-full' ref={domRef}></div>;
};

export default Editor;
