import 'bootstrap/dist/css/bootstrap.css';
import { Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { useRef, useState } from 'react';
import axios from 'axios';
const qs = require('qs')

const Index = () => {
  const [url, setURL] = useState('');
  const [detailData, setDetailData] = useState<DetailData>()
  const [isLoading, setLoading] = useState<KeyValue>({})
  const [urlDownload, setUrlDownload] = useState<KeyValue>({})

  const handleGetDetail = async (event: any) => {
    event.preventDefault();

    setUrlDownload({})

    setLoading({ ...isLoading, ['main']: true })
    const response = await axios.post("/api/getDetail", { url: url })
    setLoading({ ...isLoading, ['main']: false })

    if (response.data.result == false) {
      return
    }

    const parsed: DetailData = response.data.data
    setDetailData(parsed)
  }

  const CardItem = (data: DetailData, fsItem: FSItem) => {
    const getUrlDownload = async () => {
      setLoading({ ...isLoading, [fsItem.fs_id]: true })

      const response = await axios.post("/api/getDownloadUrl", {
        shareid: data.shareid,
        uk: data.uk,
        sign: data.sign,
        timestamp: data.timestamp,
        fid: fsItem.fs_id
      })

      setLoading({ ...isLoading, [fsItem.fs_id]: false })

      if (response.data.result == false) {
        return
      }

      setUrlDownload({ ...urlDownload, [fsItem.fs_id]: response.data.data })
    }

    return <Card key={fsItem.fs_id}>
      <Card.Body>
        <Card.Title>{fsItem.filename}</Card.Title>
        <Card.Text>
          {Number(fsItem.size) / 1000000} MB
        </Card.Text>
        <Button variant="primary" onClick={getUrlDownload} disabled={isLoading[fsItem.fs_id]}>
          Get Download URL {isLoading[fsItem.fs_id] && <Spinner className='ms-2' as="span" animation="border" size="sm" />}
        </Button>

        {urlDownload[fsItem.fs_id] && <a className='btn btn-md btn-success ms-2' href={urlDownload[fsItem.fs_id]} download={fsItem.filename}>Download Here</a>}
      </Card.Body>
    </Card>
  }

  return (
    <Container>
      <div className='text-center mt-2'>
        <h2>Terabox Dw</h2>
      </div>

      <Form onSubmit={handleGetDetail}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Enter URL Terabox</Form.Label>
          <Form.Control type="text" placeholder="URL" onChange={(e) => setURL(e.target.value)} />
          <Form.Text className="text-muted">
            https://www.terabox.com/s/1abcdefgxxxx.
          </Form.Text>
        </Form.Group>

        <div className='text-center'>
          <Button variant="primary" type="submit" disabled={isLoading['main']} >
            Get Detail {isLoading['main'] && <Spinner className='ms-2' as="span" animation="border" size="sm" />}
          </Button>
        </div>
      </Form>

      <br />

      {detailData?.list.map((item, index) => {
        return CardItem(detailData, item)
      })}

    </Container>
  );
}

interface DetailData {
  shareid: number,
  uk: number,
  sign: string,
  timestamp: number
  list: FSItem[]
}

interface FSItem {
  fs_id: string
  filename: string
  size: string
}

type KeyValue = {
  [key: string]: any;
};

export default Index