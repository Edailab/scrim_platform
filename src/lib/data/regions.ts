export interface Region {
  name: string;
  subRegions?: Region[];
}

export const regions: Region[] = [
  {
    name: "서울특별시",
    subRegions: [
      {
        name: "강남구",
        subRegions: [
          { name: "역삼동" },
          { name: "삼성동" },
          { name: "청담동" },
          { name: "논현동" },
          { name: "신사동" },
          { name: "압구정동" },
          { name: "대치동" },
          { name: "도곡동" },
        ],
      },
      {
        name: "강동구",
        subRegions: [
          { name: "천호동" },
          { name: "길동" },
          { name: "둔촌동" },
          { name: "명일동" },
          { name: "암사동" },
        ],
      },
      {
        name: "강서구",
        subRegions: [
          { name: "화곡동" },
          { name: "등촌동" },
          { name: "가양동" },
          { name: "발산동" },
          { name: "공항동" },
        ],
      },
      {
        name: "관악구",
        subRegions: [
          { name: "신림동" },
          { name: "봉천동" },
          { name: "남현동" },
        ],
      },
      {
        name: "마포구",
        subRegions: [
          { name: "합정동" },
          { name: "망원동" },
          { name: "연남동" },
          { name: "상수동" },
          { name: "서교동" },
          { name: "홍대입구" },
        ],
      },
      {
        name: "서초구",
        subRegions: [
          { name: "서초동" },
          { name: "반포동" },
          { name: "잠원동" },
          { name: "방배동" },
          { name: "양재동" },
        ],
      },
      {
        name: "송파구",
        subRegions: [
          { name: "잠실동" },
          { name: "신천동" },
          { name: "가락동" },
          { name: "문정동" },
          { name: "장지동" },
        ],
      },
      {
        name: "영등포구",
        subRegions: [
          { name: "여의도동" },
          { name: "당산동" },
          { name: "영등포동" },
          { name: "문래동" },
        ],
      },
      {
        name: "용산구",
        subRegions: [
          { name: "이태원동" },
          { name: "한남동" },
          { name: "용산동" },
          { name: "청파동" },
        ],
      },
      {
        name: "종로구",
        subRegions: [
          { name: "종로1가" },
          { name: "광화문" },
          { name: "삼청동" },
          { name: "혜화동" },
        ],
      },
    ],
  },
  {
    name: "경기도",
    subRegions: [
      {
        name: "성남시",
        subRegions: [
          { name: "분당구" },
          { name: "수정구" },
          { name: "중원구" },
        ],
      },
      {
        name: "수원시",
        subRegions: [
          { name: "영통구" },
          { name: "권선구" },
          { name: "팔달구" },
          { name: "장안구" },
        ],
      },
      {
        name: "용인시",
        subRegions: [
          { name: "기흥구" },
          { name: "수지구" },
          { name: "처인구" },
        ],
      },
      {
        name: "고양시",
        subRegions: [
          { name: "일산동구" },
          { name: "일산서구" },
          { name: "덕양구" },
        ],
      },
      {
        name: "안양시",
        subRegions: [{ name: "만안구" }, { name: "동안구" }],
      },
      {
        name: "부천시",
        subRegions: [
          { name: "원미구" },
          { name: "소사구" },
          { name: "오정구" },
        ],
      },
    ],
  },
  {
    name: "부산광역시",
    subRegions: [
      {
        name: "해운대구",
        subRegions: [
          { name: "우동" },
          { name: "중동" },
          { name: "좌동" },
          { name: "재송동" },
        ],
      },
      {
        name: "부산진구",
        subRegions: [
          { name: "서면" },
          { name: "부전동" },
          { name: "전포동" },
        ],
      },
      {
        name: "남구",
        subRegions: [
          { name: "대연동" },
          { name: "용호동" },
          { name: "문현동" },
        ],
      },
      {
        name: "수영구",
        subRegions: [
          { name: "광안동" },
          { name: "민락동" },
          { name: "수영동" },
        ],
      },
    ],
  },
  {
    name: "인천광역시",
    subRegions: [
      {
        name: "연수구",
        subRegions: [
          { name: "송도동" },
          { name: "연수동" },
          { name: "청학동" },
        ],
      },
      {
        name: "남동구",
        subRegions: [
          { name: "구월동" },
          { name: "간석동" },
          { name: "논현동" },
        ],
      },
      {
        name: "부평구",
        subRegions: [
          { name: "부평동" },
          { name: "십정동" },
          { name: "삼산동" },
        ],
      },
    ],
  },
  {
    name: "대전광역시",
    subRegions: [
      {
        name: "유성구",
        subRegions: [
          { name: "봉명동" },
          { name: "노은동" },
          { name: "지족동" },
        ],
      },
      {
        name: "서구",
        subRegions: [
          { name: "둔산동" },
          { name: "월평동" },
          { name: "갈마동" },
        ],
      },
    ],
  },
  {
    name: "대구광역시",
    subRegions: [
      {
        name: "수성구",
        subRegions: [
          { name: "범어동" },
          { name: "수성동" },
          { name: "만촌동" },
        ],
      },
      {
        name: "중구",
        subRegions: [
          { name: "동성로" },
          { name: "삼덕동" },
          { name: "대봉동" },
        ],
      },
    ],
  },
  {
    name: "광주광역시",
    subRegions: [
      {
        name: "서구",
        subRegions: [
          { name: "치평동" },
          { name: "상무동" },
          { name: "농성동" },
        ],
      },
      {
        name: "북구",
        subRegions: [
          { name: "용봉동" },
          { name: "운암동" },
          { name: "문흥동" },
        ],
      },
    ],
  },
];

export function getRegionDepth1List(): string[] {
  return regions.map((r) => r.name);
}

export function getRegionDepth2List(depth1: string): string[] {
  const region = regions.find((r) => r.name === depth1);
  return region?.subRegions?.map((r) => r.name) || [];
}

export function getRegionDepth3List(depth1: string, depth2: string): string[] {
  const region = regions.find((r) => r.name === depth1);
  const subRegion = region?.subRegions?.find((r) => r.name === depth2);
  return subRegion?.subRegions?.map((r) => r.name) || [];
}
