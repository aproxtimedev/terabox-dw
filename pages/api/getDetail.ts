import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

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
        }
    })

    const allowedHostname = [
        "www.terabox.com",
        "terabox.com",
        "www.teraboxapp.com",
        "teraboxapp.com"
    ]
    const dpLogId = "59350200172865410009"
    const jsToken = "3D1900FFEDE22A36D2E6D36ABAAE9CEB74926E292F0986A22DEF1DA25812774556754CAACE1AD4C44240AB83098E4DDC9DAA210A461D3A837D60301AEBC78DFD"
    const appId = "250528"

    var urlData: URL

    const url = req.body.url

    try {
        if (url == undefined || url == null) {
            throw new Error("Need parameter `url`");
        }

        try {
            urlData = new URL(url)
        } catch (error) {
            throw new Error("Not valid url");
        }

        const found = allowedHostname.find(element => element == urlData.hostname)
        if (found == undefined || found == null) {
            throw new Error("Not valid hostname");
        }

        const shareCode = urlData.pathname.split("/").slice(-1)[0]
        
        if (shareCode[0] != "1") {
            throw new Error("Not valid share code");
        }

        try {
            const response = await axiosClient.get(`https://www.terabox.com/api/shorturlinfo?app_id=${appId}&web=1&channel=dubox&clienttype=0&jsToken=${jsToken}&dp-logid=${dpLogId}&shorturl=${shareCode}&root=1`)

            if (response.data.errno != 0) {
                throw new Error("Failed get data");
            }

            res.status(200).json({
                result: true,
                data: {
                    shareid: response.data.shareid,
                    uk: response.data.uk,
                    sign: response.data.sign,
                    timestamp: response.data.timestamp,
                    list: response.data.list.map((fid: any) => {
                        return {
                            fs_id: fid.fs_id,
                            filename: fid.server_filename,
                            size: fid.size
                        }
                    }),
                }
            })
        } catch (error) {
            throw new Error("Failed get data");
        }

    } catch (error: Error | any) {
        res.status(400).json({ result: false, message: error.message })
        return
    }
}