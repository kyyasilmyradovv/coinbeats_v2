export type TCategory = {
  id: number;
  name: string;
};

export type TCategorySendInfo = {
  offset: number;
  limit: number;
  keyword?: string;
};
