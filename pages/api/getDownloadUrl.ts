import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

const qs = require('qs');

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userAgent = req.headers['user-agent']
    const axiosClient = axios.create({
        headers: {
            'User-Agent': userAgent,
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.terabox.com/sharing/link?surl=gfujeeyKv_ZGFd_dAJ3uXw',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
        },
        maxRedirects: 0
    })

    const dpLogId = "59350200172865410009"
    const jsToken = "3D1900FFEDE22A36D2E6D36ABAAE9CEB74926E292F0986A22DEF1DA25812774556754CAACE1AD4C44240AB83098E4DDC9DAA210A461D3A837D60301AEBC78DFD"
    const appId = "250528"

    const fid = req.body.fid
    const shareId = req.body.shareid
    const sign = req.body.sign
    const uk = req.body.uk
    const timestamp = req.body.timestamp

    try {
        if (
            fid == undefined ||
            shareId == undefined ||
            sign == undefined ||
            uk == undefined ||
            timestamp == undefined
        ) {
            throw new Error("Please fill all required data");
        }

        var response = await axiosClient.post(`https://www.terabox.com/share/download` +
            `?app_id=${appId}` +
            `&web=1` +
            `&channel=dubox` +
            `&clienttype=0` +
            `&jsToken=${jsToken}` +
            `&dp-logid=${dpLogId}` +
            `&shareid=${shareId}` +
            `&sign=${sign}` +
            `&timestamp=${timestamp}`,

            qs.stringify({ 'product': 'share', 'nozip': 0, 'fid_list': `[${fid}]`, 'uk': uk, 'primaryid': shareId }),
            { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )

        if (response.data.errno != 0) {
            throw new Error(`Failed get url download | Errno: ${response.data.errno}`);
        }

        var dlink = response.data.dlink
        var response = await axiosClient.get(dlink, {
            validateStatus: function (status) {
                return status == 302 || (status >= 200 && status < 300);
            }
        })

        if (response.status != 302) {
            throw new Error("Failed get url download");
        }

        const urlDownload = response.headers.location
        
        res.status(200).json({result: true, data: urlDownload})

    } catch (error: Error | any) {
        res.status(400).json({ result: false, message: error.message })
    }

}