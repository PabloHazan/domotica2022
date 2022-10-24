import { ReadStream } from 'fs';

export interface Downloable {
    filename: string;
    stream: ReadStream;
}

export const isDowloable = (result: any) : result is Downloable => 
    (typeof result?.filename === 'string') &&
    (result?.stream instanceof ReadStream);
