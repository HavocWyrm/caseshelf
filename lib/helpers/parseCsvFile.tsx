import Papa from 'papaparse';

export function parseCsvFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (result.errors.length > 0) {
                    reject(result.errors);
                } else {
                    resolve(result.data);
                }
            },
        });
    });
}