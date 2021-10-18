# Yêu cầu:
## Quét 2 contract:
- 0x01bcAD3c4a23e4edD164e7298567F071Ff59560C 
	blockStart: 11766355
- 0x4d9925f0f1929345ed58d3c6fea24aa9ecaf6ebe
	blockStart: 11766359	

## Input:  event Deposit:
	tính tổng của tất cả các lần deposit của user từ lúc deploy tới 7h sáng ngày 18/10/2021 
	( blockStop 11864779 - 0h sáng UTC 0 ) 

## OUTPUT: 
	50 người Deposit nhiều nhất: 3 lần
	1000 người Deposit nhiều tiếp theo

# Các bước làm 
## Bước 1: Lọc các Event Deposit từ mạng
```
    node index.js
```
=> được các file: 
log_560C: các Tx của contract 0x01bcAD3c4a23e4edD164e7298567F071Ff59560C
log_6ebe: các Tx của contract 0x4d9925f0f1929345ed58d3c6fea24aa9ecaf6ebe

560C.csv: địa chỉ ví và amount deposit contract 0x01bcAD3c4a23e4edD164e7298567F071Ff59560C
6EBE.csv: địa chỉ ví và amount deposit contract 0x4d9925f0f1929345ed58d3c6fea24aa9ecaf6ebe

## Bước 2: gộp các địa chỉ trùng nhau ở 2 pool, cộng tổng amount
- tạo total.csv từ 2 file 560C.csv và 6EBE.csv
```
    node filter.js
```
=> được file filered_data.csv: chứa danh sách các ví và tổng số amount deposit 2 pool

## Bước 3: sắp xếp các địa chỉ ví theo tổng amount giảm dần
```
    node sort.js
```
=> được file sorted_data.csv 


## Kết quả là file sorted_data.csv