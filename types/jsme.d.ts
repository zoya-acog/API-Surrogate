// Type definitions for JSME
declare global {
    interface Window {
      JSME: any
      jsmeOnLoad: () => void
      JSApplet: {
        JSME: new (
          containerId: string,
          width: string,
          height: string,
        ) => {
          options: (key: string, value: any) => void
          readGenericMolecularInput: (input: string) => void
          smiles: () => string
          molFile: () => string
          setCallBack: (eventName: string, callback: () => void) => void
        }
      }
    }
  }
  
  export {}
  