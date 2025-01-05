import axios from "axios";

export class ImgurApi {
  private readonly apiUrl = "https://api.imgur.com/3/image";

  public async uploadImage(imageUrl: string) {
    const { data } = await axios.post(this.apiUrl, {
      image: imageUrl,
      type: "url"
    });

    return data.data.link;
  }

  public async getImageLink(imageId: string) {
    const { data } = await axios.get(`${this.apiUrl}/${imageId}`);

    return data.data.link;
  }
}

export const imgurApi = new ImgurApi();