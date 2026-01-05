export interface ISetting {
  _id: string;
  key: string;
  name: string;
  description?: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "select"
    | "textarea"
    | "wysiwyg"
    | "checkbox"
    | "radio"
    | "password"
    | "toggle";
  value: any;
  meta?: {
    textarea?: boolean;
    options?: Array<{ label: string; value: any }>;
    min?: number;
    max?: number;
    step?: number;
  };
  group?: string;
  order?: number;
  required?: boolean;
  public?: boolean;
  editable?: boolean;
  visible?: boolean;
  validation?: {
    pattern?: string;
    message?: string;
    options?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TabConfig {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

export interface SettingFormItemProps {
  setting: ISetting;
  onValueChange: (field: string, value: any) => void;
}

