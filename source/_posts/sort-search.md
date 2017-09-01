
layout: post
title: 常用排序查找算法 JavaScript 实现
banner: assets/img/sort.jpg
tags: algorithm
---

一直没有对算法进行系统的了解，所以在这里对常用算法（排序和查找）做一些整理。

## 冒泡排序

冒泡排序，顾名思义，在多次循环中，小的数字会浮到数组左侧，大的数组则慢慢沉下去。

```js
// 交换方法
function swap(arr, i, j) {
    var temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}
```

```js
function bubbleSort(arr) {
    for(var i = 1; i < arr.length; i++) {
        for(var j = 0; j <= i; j++) {
            if(arr[i] < arr[j]) {
                swap(arr, i, j)
            }
            console.log(arr)
        }
    }

    return arr
}
```

## 插入排序

插入排序中，插入是指选取合适的元素插入到适当的位置。

插入排序有两个循环。外循环将数组元素挨个移动，而内循环则对外循环中选中的元素及 它后面的那个元素进行比较。如果外循环中选中的元素比内循环中选中的元素小，那么数 组元素会向右移动，为内循环中的这个元素腾出位置。（数据结构与算法JavaScript描述）

```js
function insertionSort(arr) {
    var preIndex, current
    for(var i = 1; i < arr.length; i++) {
        preIndex = i - 1
        current = arr[i]
        while(preIndex >= 0 && arr[preIndex] > current) {
            arr[preIndex+1] = arr[preIndex];
            preIndex--
        }
        arr[preIndex+1] = current
    }
    return arr
}
```

## 选择排序

选择排序中的选择是选择数组中最小的元素，放到数组的第一位。

选择排序从数组的开头开始，将第一个元素和其他元 素进行比较。检查完所有元素后，最小的元素会被放到数组的第一个位置，然后算法会从 第二个位置继续。这个过程一直进行，当进行到数组的倒数第二个位置时，所有的数据便 完成了排序。（数据结构与算法JavaScript描述）

```js
function selectionSort(arr) {
    var minIndex;
    for(var i = 0; i < arr.length - 1; i++) {
        minIndex = i
        for(var j = i+1; j < arr.length; j++) {
            if(arr[j] < arr[minIndex]) {
                minIndex = j
            }
        }

        if(minIndex !== i) {
            swap(arr, minIndex, i)
        }
    }

    return arr
}
```

## 快速排序

快速排序很快。

它是一种分而治之的算法，通过递归的方 式将数据依次分解为包含较小元素和较大元素的不同子序列。该算法不断重复这个步骤直 到所有数据都是有序的。（数据结构与算法JavaScript描述）

```js
function quickSort(arr) {
    if(!arr.length) return []
    var lesser = [];
    var greater = [];
    var middle = arr[0];

    for(var i = 1; i < arr.length; i++) {
        if(arr[i] <= middle) {
            lesser.push(arr[i])
        } else {
            greater.push(arr[i])
        }
    }

    return quickSort(lesser).concat(middle).concat(quickSort(greater))
}
```

## 合并排序

把一系列排好序的子序列合并成一个大的完整有序序列。

```js
function mergeSort(arr) { 
    var len = arr.length;
    if(len < 2) {
        return arr;
    }
    var middle = Math.floor(len / 2),
        left = arr.slice(0, middle),
        right = arr.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    var result = [];

    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

```

## 二分查找

只对有序的数据集有效。

```js
function binSearch(arr, item) {
    var high = arr.length - 1
    var low = 0
    if(low > high) return -1

    while(low <= high) {
        var middle = Math.ceil((low + high)/2)

        if(item > arr[middle]) {
            low = middle + 1
        } else if(item < arr[middle]) {
            high = middle - 1
        } else {
            return middle
        }
    }

    return -1;
}
```







