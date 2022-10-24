import { CreateResult } from 'html-pdf'
import { Downloable } from '../../../framework/interfaces/downloable.interface'

export const createDowloadFile = (filename: string, pdf: CreateResult): Promise<Downloable> => {
    return new Promise<Downloable>((resolve, reject) => {
        pdf.toStream((err, stream) => {
            if (err) return reject(err);
            resolve({ filename, stream });
        })
    })
}